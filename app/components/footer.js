export default function Footer() {
    return (
        <footer style={styles.footer}>
            <p>&copy; {new Date().getFullYear()} Développé par <strong>Paul-Jean Girault</strong> et <strong>Quentin Nempont</strong></p>
        </footer>
    );
}

const styles = {
    footer: {
        position: "fixed",
        bottom: "0",
        width: "100%",
        padding: "15px",
        textAlign: "center",
        backgroundColor: "#333",
        color: "white",
        zIndex: 1000, // Ensure the footer stays on top of other content
    },
    link: {
        color: "#ffcc00",
        textDecoration: "none",
    }
};
