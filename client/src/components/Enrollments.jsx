import { useState, useEffect } from 'react';
import '../App.css';
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Loader from "./Loader.jsx";

const Enrollments = () => {

    const authFetch = useAuthFetch();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [courses, setCourses] = useState([]);
    const [students, setstudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const notify = useNotification();

    const fetchEnrollments = async () => {
        setEnrollmentsLoading(true);
        try {
            const res = await authFetch(endpoints.enrollments);
            if (!res.ok) {
                throw new Error("Something went wrong while fetching enrollments")
            }
            const data = await res.json();
            setEnrollments(data);
        } catch (err) {
            console.error(err);
            notify.error("Something went wrong while fetching enrollments");
        } finally {
            setEnrollmentsLoading(false);
        }
    }

    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            const res = await authFetch(`${endpoints.courses}?page=1&limit=100`);
            if (!res.ok) {
                throw new Error("Failed to fetch courses");
            }
            const body = await res.json();
            setCourses(body.data ?? []);
        } catch (err) {
            console.error(err);
            notify.error("Something went wrong while fetching courses");
        } finally {
            setCoursesLoading(false);
        }
    }

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await authFetch(endpoints.students);
            if (!res.ok) {
                throw new Error("Something went wrong while fetching students");
            }
            const data = await res.json();
            setstudents(data);
        } catch (err) {
            console.error(err);
            notify.error("Something went wrong while fetching students");
        } finally {
            setStudentsLoading(false);
        }
    }


    useEffect(() => {
        fetchEnrollments();
        if (isAdmin) {
            fetchCourses();
            fetchStudents();
        }
    }, [isAdmin]);

    const enrollStudent = async () => {
        setIsSubmitting(true);
        try {
            const res = await authFetch(endpoints.enrollments, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    courseId: selectedCourse,
                    courseName: courses.find(i => i.id === parseInt(selectedCourse)).title,
                    studentName: students.find(i => i.id === parseInt(selectedStudent)).username
                })
            });
            const result = await res.json();
            if (res.ok) {
                notify.success("Student enrolled");
                fetchEnrollments();
            } else {
                notify.error(result.error);
            }
        } catch (err) {
            console.error(err);
            notify.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    const unenroll = async (id) => {
        setIsSubmitting(true);
        try {
            const res = await authFetch(`${endpoints.enrollments}/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                notify.error("Something went wrong");
            } else {
                fetchEnrollments();
                notify.success("Unenrolled successfully");
            }
        } catch (error) {
            console.error(error);
            notify.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return <div style={{ padding:"0px 24px" }}>

        <h1>Enrollments</h1>
        {!isAdmin && (
            <p style={{ color: "#888", marginBottom: "1rem" }}>
                View only — contact an admin to enroll or unenroll students.
            </p>
        )}
        <div className="loader-section" style={{ minHeight: enrollmentsLoading ? "6rem" : undefined }}>
            <Loader loading={enrollmentsLoading} />
            {
                enrollments.map(e => <div key={e.id}>
                    <p>{e.student_name} enrolled in course {e.course_name}</p>
                    {isAdmin && (
                        <button onClick={() => unenroll(e.id)} disabled={isSubmitting}>Unenroll</button>
                    )}
                </div>
                )
            }
        </div>
        {isAdmin && (
        <>
        <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="loader-section" style={{ minWidth: "12rem", minHeight: coursesLoading ? "5rem" : undefined }}>
                <Loader loading={coursesLoading} />
                <p>Courses</p>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading || isSubmitting}>
                    <option value={""}>Select</option>
                    {
                        courses.map((c) =>
                            <option key={c.id} value={c.id}
                            >{c.title}</option>)
                    }
                </select>
            </div>
            <div className="loader-section" style={{ minWidth: "12rem", minHeight: studentsLoading ? "5rem" : undefined }}>
                <Loader loading={studentsLoading} />
                <p>Students</p>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={studentsLoading || isSubmitting}>
                    <option value={""}>Select</option>
                    {
                        students.map((c) =>
                            <option key={c.id} value={c.id}
                            >{c.username}</option>)
                    }
                </select>
            </div>
        </div>
        <div className="loader-section" style={{ marginTop: '1rem' }}>
            <Loader loading={isSubmitting} />
            <button disabled={!selectedStudent || !selectedCourse || isSubmitting}
                onClick={enrollStudent}
            >Enroll</button>
        </div>
        </>
        )}
    </div>
}

export default Enrollments;
