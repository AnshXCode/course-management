import { useState, useEffect } from 'react';
import '../App.css';
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Loader from "./Loader.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Courses() {

    const authFetch = useAuthFetch();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [course, setCourse] = useState({
        code: "",
        title: "",
        description: "",
        capacity: 60
    });
    const [selectedCourse, setSelectedCourse] = useState("");
    const [draftEdits, setDraftEdits] = useState([]);
    const notify = useNotification();

    // Server state: course list — cached by queryKey, refetch skipped while fresh (see queryClient.js)
    const {
        data: courses = [],
        isLoading: coursesLoading,
        isError: coursesError,
        error: coursesFetchError,
    } = useQuery({
        queryKey: ["courses"],
        queryFn: async () => {
            const res = await authFetch(endpoints.courses);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch courses");
            }
            return data;
        },
    });

    // Server state: students for selected course — separate key so it doesn't clash with the list cache
    const {
        data: studentsEnrolledInCourse = [],
        isLoading: enrolledStudentsLoading,
        isError: enrolledStudentsError,
        error: enrolledStudentsFetchError,
    } = useQuery({
        queryKey: ["courses", selectedCourse, "students"],
        queryFn: async () => {
            const res = await authFetch(`${endpoints.courses}/${selectedCourse}/students`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch students for this course");
            }
            return data;
        },
        enabled: !!selectedCourse, // wait until user picks a course — avoids useless API calls
    });

    // After a write, mark list cache stale so this tab refetches (like server cache invalidation)
    const invalidateCourses = () => {
        queryClient.invalidateQueries({ queryKey: ["courses"] });
    };

    const createCourseMutation = useMutation({
        mutationFn: async (coursePayload) => {
            const res = await authFetch(endpoints.courses, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(coursePayload),
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to create course");
            }
            return result;
        },
        onSuccess: () => {
            invalidateCourses();
            setCourse({ code: "", title: "", description: "", capacity: 60 });
            notify.success("Course created");
        },
        onError: (err) => {
            notify.error(err.message || "Failed to create course");
        },
    });

    const updateCourseMutation = useMutation({
        mutationFn: async ({ id, courseToUpdate }) => {
            const res = await authFetch(`${endpoints.courses}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseToUpdate),
            });
            if (!res.ok) {
                const result = await res.json().catch(() => ({}));
                throw new Error(result.error || "Failed to update course");
            }
            return courseToUpdate;
        },
        onSuccess: (courseToUpdate) => {
            invalidateCourses();
            handleRemoveFromEdits(courseToUpdate);
            notify.success("Course updated");
        },
        onError: (err) => {
            notify.error(err.message || "Failed to update course");
        },
    });

    const deleteCourseMutation = useMutation({
        mutationFn: async (id) => {
            const res = await authFetch(`${endpoints.courses}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete course");
            }
            return id;
        },
        onSuccess: (id) => {
            invalidateCourses();
            // Drop enrolled-students cache for deleted course if it was selected
            queryClient.removeQueries({ queryKey: ["courses", String(id), "students"] });
            if (String(selectedCourse) === String(id)) {
                setSelectedCourse("");
            }
            notify.success("Course deleted");
        },
        onError: (err) => {
            notify.error(err.message || "Failed to delete course");
        },
    });

    const isSubmitting =
        createCourseMutation.isPending ||
        updateCourseMutation.isPending ||
        deleteCourseMutation.isPending;

    useEffect(() => {
        if (coursesError) {
            notify.error(coursesFetchError?.message || "Something went wrong while fetching courses");
        }
    }, [coursesError, coursesFetchError, notify]);

    useEffect(() => {
        if (enrolledStudentsError) {
            notify.error(enrolledStudentsFetchError?.message || "Failed to fetch students for this course");
        }
    }, [enrolledStudentsError, enrolledStudentsFetchError, notify]);

    const handleFormUpdate = (e) => {
        setCourse(prev => ({
            ...prev, [e.target.name]: e.target.value
        }))
    }

    const CreateNewCourse = (e) => {
        e.preventDefault();
        createCourseMutation.mutate(course);
    }

    const handleDelete = (id) => {
        deleteCourseMutation.mutate(id);
    }

    const handleCourseFieldUpdate = (id, e) => {
        setDraftEdits(prev => prev.map(c => c.id === id ? {
            ...c, [e.target.name]: e.target.value
        } : c));
    };

    const updateCourse = (e, id) => {
        e.preventDefault();
        const courseToUpdate = draftEdits.find((item) => item.id === id);
        updateCourseMutation.mutate({ id, courseToUpdate });
    }

    const handleRemoveFromEdits = (edit) => {
        setDraftEdits(prev => prev.filter(c => c.id !== edit.id));
    }

    return (
        <div style={{ padding: "0px 24px" }}>
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
                    <Loader loading={createCourseMutation.isPending} />
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
