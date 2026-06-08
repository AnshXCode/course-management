import "../App.css";

export default function Loader({ loading }) {
    if (!loading) return null;

    return (
        <div className="loader" role="status" aria-label="Loading">
            <div className="loader-spinner" />
        </div>
    );
}
