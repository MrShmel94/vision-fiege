import { createTheme } from "@mui/material/styles";

export const gradientBackground = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: -1,
  overflow: "hidden",
  background: "#f9f9f9",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background: `
      radial-gradient(circle at 20% 30%, rgba(184, 33, 54, 0.12) 0%, transparent 60%),
      radial-gradient(circle at 80% 70%, rgba(0, 142, 147, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(248, 248, 248, 0.08) 0%, transparent 60%)
    `,
    animation: "rotate 45s linear infinite",
    backgroundSize: "200% 200%",
    filter: "blur(45px)",
    opacity: 0.9,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background: `
      radial-gradient(circle at 70% 20%, rgba(184, 33, 54, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 30% 80%, rgba(0, 142, 147, 0.18) 0%, transparent 60%),
      radial-gradient(circle at 60% 60%, rgba(248, 248, 248, 0.1) 0%, transparent 60%)
    `,
    animation: "rotate 60s ease-in-out infinite reverse",
    backgroundSize: "200% 200%",
    filter: "blur(45px)",
    opacity: 0.8,
  },
};

export const gradientKeyframes = `
  @keyframes rotate {
    0% {
      transform: translate(-15%, -15%) rotate(0deg) scale(1.2);
    }
    50% {
      transform: translate(15%, 15%) rotate(180deg) scale(1.3);
    }
    100% {
      transform: translate(-15%, -15%) rotate(360deg) scale(1.2);
    }
  }
`;

const theme = createTheme({
  palette: {
    primary: { main: "#B82136" },
    secondary: { main: "#008E93" },
    background: { default: "#ffffff" },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700 },
    h2: { fontSize: "1.8rem", fontWeight: 600 },
    body1: { fontSize: "1rem" },
  },
});

export default theme;