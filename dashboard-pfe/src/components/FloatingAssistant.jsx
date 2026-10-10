import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useState } from "react";

export default function FloatingAssistant() {

  const navigate = useNavigate();

  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (

    <div
      style={{
        position: "fixed",
        bottom: 22,
        right: 22,
        zIndex: 9999
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* CLOSE BUTTON */}

      {hovered && (

        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          style={{
            position: "absolute",
            top: -6,
            right: -6,

            width: 30,
            height: 30,

            borderRadius: "50%",
            border: "none",

            background: "#2b2b2b",
            color: "#fff",

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            boxShadow: "0 4px 14px rgba(0,0,0,0.45)"
          }}
        >

          <X size={16} />

        </button>

      )}

      {/* FLOATING ASSISTANT */}

      <div
        onClick={() => navigate("/ai")}
        style={{
          width: 82,
          height: 82,

          borderRadius: "50%",

          background: "#fff",

          cursor: "pointer",

          overflow: "hidden",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          border: "4px solid rgba(255,255,255,0.92)",

          transition: "all 0.25s ease",

          transform: hovered
            ? "scale(1.06)"
            : "scale(1)",

          boxShadow: hovered
            ? "0 0 25px rgba(0,166,81,0.45)"
            : "0 10px 30px rgba(0,0,0,0.45)"
        }}
      >

        <img
          src="/assistant-ocp.png"
          alt="Assistant IA"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

      </div>

    </div>

  );
}
