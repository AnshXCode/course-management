import { useState, useEffect } from 'react';
import '../App.css';
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Loader from "./Loader.jsx";

function Students() {

    const authFetch = useAuthFetch();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [students, setstudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [student, setstudent] = useState({
        username: "",
        email: "",
    });

    const [draftEdits, setDraftEdits] = useState([]);
    const notify = useNotification();

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
        fetchStudents();
    }, []);


    const handleFormUpdate = (e) => {
        setstudent(prev => ({
            ...prev, [e.target.name]: e.target.value
        }))
    }

    const CreateNewstudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await authFetch(endpoints.students, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            const data = await res.json();
            if (!res.ok) {
                notify.error(data.error || "Failed to create student");
                return;
            };
            fetchStudents();
            notify.success("Student created");
        } catch (err) {
            console.error(err);
            notify.error("Failed to create student");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = async (id) => {
        setIsSubmitting(true);
        try {
            const res = await authFetch(`${endpoints.students}/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) {
                notify.error("Failed to delete student");
                return;
            }
            fetchStudents();
            notify.success("Student deleted");
        } catch (error) {
            console.error(error);
            notify.error("Failed to delete student");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handlestudentFieldUpdate = (id, e) => {
        setDraftEdits(prev => prev.map(c => c.id === id ? {
            ...c, [e.target.name]: e.target.value
        } : c));
    };

    const updatestudent = async (e, id) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const student = draftEdits.find(e => e.id === id);
            const res = await authFetch(`${endpoints.students}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            if (!res.ok) {
                notify.error("Failed to update student");
                return;
            };
            handleRemoveFromEdits(student);
            fetchStudents();
            notify.success("Student updated");
        } catch (error) {
            console.error(error.message);
            notify.error("Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRemoveFromEdits = (edit) => {
        setDraftEdits(prev => prev.filter(c => c.id !== edit.id));
    }

    return (
        <div style={{ padding:"0px 24px" }}>
            <h1>Students</h1>
            {!isAdmin && (
                <p style={{ color: "#888", marginBottom: "1rem" }}>
                    View only — contact an admin to add or edit students.
                </p>
            )}
            <div className="loader-section" style={{ minHeight: studentsLoading ? "6rem" : undefined }}>
                <Loader loading={studentsLoading} />
                <ul>
                    {
                        students.map((c) => {
                            const edit = draftEdits.find(e => e.id === c.id)
                            if (edit && isAdmin) {
                                return <li key={c.id}>
                                    <form style={{ display: 'flex', gap: '1rem' }}
                                        onSubmit={(e) => updatestudent(e, c.id)}
                                    >
                                        <input name="username" value={edit.username} placeholder="username" onChange={(e) => handlestudentFieldUpdate(c.id, e)} />
                                        <input name="email" value={edit.email} placeholder="email" onChange={(e) => handlestudentFieldUpdate(c.id, e)} />
                                        <button onClick={() => handleRemoveFromEdits(c)} type="button" disabled={isSubmitting}>Cancel</button>
                                        <button type="submit" disabled={isSubmitting}>Save</button>
                                    </form>
                                </li>
                            } else {
                                return <li key={c.id}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <p>
                                            <strong>{c.username}</strong> - {c.email}

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
                <h1>Add New student</h1>
                <form style={{ display: 'flex', gap: '1rem' }}
                    onSubmit={CreateNewstudent}>
                    <input name="username" value={student.username} placeholder="username" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <input name="email" value={student.email} placeholder="email" onChange={handleFormUpdate} disabled={isSubmitting} />
                    <button type="submit" disabled={isSubmitting}>Submit</button>
                </form>
            </div>
            )}
        </div>
    )
}

export default Students;
