import { useState, useEffect } from 'react';
import '../App.css';
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Loader from "./Loader.jsx";

function Courses() {

    const authFetch = useAuthFetch();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [enrolledStudentsLoading, setEnrolledStudentsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [course, setCourse] = useState({
        code: "",
        title: "",
        description: "",
        capacity: 60
    });
    const [selectedCourse, setSelectedCourse] = useState("");
    const [draftEdits, setDraftEdits] = useState([]);
    const [studentsEnrolledInCourse, setStudentsEnrolledInCourse] = useState([]);
    const notify = useNotification();

    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            const res = await authFetch(endpoints.courses);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch courses");
            }
            setCourses(data);
        } catch (err) {
            console.error(err);
            notify.error(err.message || "Something went wrong while fetching courses");
        } finally {
            setCoursesLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);


    const handleFormUpdate = (e) => {
        setCourse(prev => ({
            ...prev, [e.target.name]: e.target.value
        }))
    }

    const CreateNewCourse = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await authFetch(endpoints.courses, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course)
            });
            if (!res.ok) {
                notify.error("Failed to create course");
                return;
            };
            fetchCourses();
            notify.success("Course created");
        } catch (err) {
            console.error(err);
            notify.error("Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = async (id) => {
        setIsSubmitting(true);
        try {
            const res = await authFetch(`${endpoints.courses}/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) {
                notify.error("Failed to delete course");
                return;
            }
            fetchCourses();
            notify.success("Course deleted");

        } catch (error) {
            console.error(error);
            notify.error("Failed to delete course");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCourseFieldUpdate = (id, e) => {
        setDraftEdits(prev => prev.map(c => c.id === id ? {
            ...c, [e.target.name]: e.target.value
        } : c));
    };

    const updateCourse = async (e, id) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const courseToUpdate = draftEdits.find((item) => item.id === id);
            const res = await authFetch(`${endpoints.courses}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseToUpdate)
            });
            if (!res.ok) {
                notify.error("Failed to update course");
                return;
            }
            handleRemoveFromEdits(courseToUpdate);
            fetchCourses();
            notify.success("Course updated");
        } catch (error) {
            console.error(error.message);
            notify.error("Failed to update course");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRemoveFromEdits = (edit) => {
        setDraftEdits(prev => prev.filter(c => c.id !== edit.id));
    }

    const fetchStudentsEnrolledInACourse = async () => {
        if (!selectedCourse) {
            setStudentsEnrolledInCourse([]);
            return;
        }
        setEnrolledStudentsLoading(true);
        try {
            const res = await authFetch(`${endpoints.courses}/${selectedCourse}/students`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch students for this course");
            }
            setStudentsEnrolledInCourse(data);
        } catch (error) {
            console.error(error);
            notify.error(error.message || "Failed to fetch students for this course");
        } finally {
            setEnrolledStudentsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsEnrolledInACourse();
    }, [selectedCourse])

    return (
        <div style={{ padding:"0px 24px" }}>
            <h1>Courses</h1>
            {!isAdmin && (
                <p style={{ color: "#888", marginBottom: "1rem" }}>
                    View only — contact an admin to add or edit courses.
                </p>
            )}
            <div className="loader-section" style={{ minHeight: coursesLoading ? "6rem" : undefined }}>
                <Loader loading={coursesLoading} />
                <ul>
                    {
                        courses.map((c) => {
                            const edit = draftEdits.find(e => e.id === c.id)
                            if (edit && isAdmin) {
                                return <li key={c.id}>
                                    <form style={{ display: 'flex', gap: '1rem' }}
                                        onSubmit={(e) => updateCourse(e, c.id)}
                                    >
                                        <input name="code" value={edit.code} placeholder="code" onChange={(e) => handleCourseFieldUpdate(c.id, e)} />
                                        <input name="title" value={edit.title} placeholder="title" onChange={(e) => handleCourseFieldUpdate(c.id, e)} />
                                        <input name="description" value={edit.description} placeholder="description" onChange={(e) => handleCourseFieldUpdate(c.id, e)} />
                                        <input name="capacity" value={edit.capacity} type="number" placeholder="capacity" onChange={(e) => handleCourseFieldUpdate(c.id, e)} />
                                        <button onClick={() => handleRemoveFromEdits(c)} type="button" disabled={isSubmitting}>Cancel</button>
                                        <button type="submit" disabled={isSubmitting}>Save</button>
                                    </form>
                                </li>
                            } else {
                                return <li key={c.id}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <p>
                                            <strong>{c.code}</strong> - {c.title} (capacity : {c.capacity})
                                            <br />
                                            <i>{c.description}</i>

                                        </p>
                                        {isAdmin && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <button onClick={() => setDraftEdits(prev => [...prev, c])} disabled={isSubmitting}>Edit</button>
                                            <button onClick={() => handleDelete(c.id)} disabled={isSubmitting}>Delete</button>
                                        </div>
                                        )}
                                    </div>
                                </li>
                            }
                        })
                    }
                </ul>
            </div>
            {isAdmin && (
            <div className="loader-section">
                <Loader loading={isSubmitting} />
                <h1>Add New Course</h1>
                <form style={{ display: 'flex', gap: '1rem' }}
                    onSubmit={CreateNewCourse}>
                    <input name="code" value={course.code} placeholder="code" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <input name="title" value={course.title} placeholder="title" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <input name="description" value={course.description} placeholder="description" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <input name="capacity" value={course.capacity} type="number" placeholder="capacity" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <button type="submit" disabled={isSubmitting}>Submit</button>
                </form>
            </div>
            )}
            <div>
                <h1>Students Enrolled in a course</h1>
                <div>
                    <p>Courses</p>
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                        <option value={""}>Select</option>
                        {
                            courses.map((c) =>
                                <option key={c.id} value={c.id}
                                >{c.title}</option>)
                        }
                    </select>
                </div>
            </div>
            <div className="loader-section" style={{ minHeight: enrolledStudentsLoading ? "4rem" : undefined }}>
                <Loader loading={enrolledStudentsLoading} />
                {
                    studentsEnrolledInCourse.map((s) => <p key={s.id}>{s.username}</p>)
                }
            </div>
        </div>
    )
}

export default Courses;
