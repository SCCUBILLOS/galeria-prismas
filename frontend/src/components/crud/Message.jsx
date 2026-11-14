import React from "react";

const Message = ({ msg, bgColor = "#dc3545" }) => {
  const styles = {
    padding: "1rem",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    backgroundColor: bgColor,
    borderRadius: "0.5rem",
  };

  return (
    <div style={styles} role="alert" aria-live="assertive">
      <p className="m-0">{msg}</p>
    </div>
  );
};

export default Message;
