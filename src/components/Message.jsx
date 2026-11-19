// One box for loading, error and empty states.
export default function Message({ title, text, buttonText, onClick, error = false }) {
  return (
    <div className={error ? "message error" : "message"} role={error ? "alert" : "status"}>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {buttonText && (
        <button className="button secondary" onClick={onClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
}
