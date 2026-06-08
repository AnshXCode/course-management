import { useContext } from "react";
import { NotificationContext } from "../context/notificationContext.jsx";

export default function useNotification() {
    const notify = useContext(NotificationContext);
    if (!notify) {
        throw new Error("useNotification must be used within NotificationProvider");
    }
    return notify;
}
