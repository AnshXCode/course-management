import { useState, useRef, useEffect } from "react";
import { NotificationContext } from "./notificationContext.jsx";

const TOAST_DURATION_MS = 3000;

function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const timerRef = useRef([]);
    const idRef = useRef(0);


    const addNotification = (notification) => {
        const currentId = idRef.current;
        idRef.current += 1;
        setNotifications((prev) => [...prev, { ...notification, id: currentId }]);
        const timer = setTimeout(() => {
            setNotifications((prev) => prev.filter((i) => i.id !== currentId));
        }, TOAST_DURATION_MS);
        timerRef.current.push(timer);
    };

    const notify = {
        success: (message) => addNotification({ type: "success", message }),
        error: (message) => addNotification({ type: "error", message }),
    };

    useEffect(() => {
        return () => {
            timerRef.current.forEach(clearTimeout);
            timerRef.current = [];
        };
    }, []);

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            <div
                style={{
                    position: "fixed",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    zIndex: 9999,
                }}
            >
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        style={{
                            border: "1px solid",
                            borderRadius: "2rem",
                            color:
                                n.type === "error"
                                    ? "red"
                                    : n.type === "success"
                                        ? "green"
                                        : "yellow",
                            padding: "1rem",
                            background: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                    >
                        {n.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export default NotificationProvider;




// useCallback is used here to memoize the addNotification function, ensuring that its identity
// does not change between renders unless its dependencies change (in this case, there are none,
// so it is created once). This can help prevent unnecessary re-renders of consumers that depend
// on addNotification (e.g., if it were passed as a prop or used in useEffect dependencies).
//
// In this specific usage within NotificationProvider, memoizing addNotification is not strictly
// necessary, as it is only used internally and not passed outside the provider. However,
// if notify (which uses addNotification) is memoized or provided through context, it can help
// keep referential stability, which might be beneficial for performance optimization in large trees.
//
// If you removed useCallback and simply defined addNotification as a normal function:
//
//   const addNotification = (notification) => { ... }
//
// it would still work fine in this particular context, but if you started passing
// addNotification to other hooks/components, useCallback might prevent unnecessary reruns.
// Not much use for useCallback here, so define as a regular function.


// There is little need for useMemo here, since 'notify' is a simple object
// whose only dependency is addNotification (which itself is stable via useCallback).
// This could just be a plain object, or, if you're concerned about referential equality,
// you could define it inline without useMemo. For simplicity, here's a direct definition: