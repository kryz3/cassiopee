export default function Contact() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Contactez-nous</h1>
                <p className="mb-4 text-center text-black">
                    Pour toute question, veuillez nous contacter à :
                    <a href="mailto:tresorerie@asint.fr" style={styles.link}> tresorerie@asint.fr</a>
                </p>
                <form action="mailto:tresorerie@asint.fr" method="post" encType="text/plain">
                    <div className="mb-4">
                        <label className="block text-black">Nom</label>
                        <input type="text" name="name" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Votre nom" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Email</label>
                        <input type="email" name="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Votre email" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Message</label>
                        <textarea name="message" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Votre message" rows="4" required></textarea>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">Envoyer</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    link: {
        color: "#ffcc00",
        textDecoration: "none",
    }
};
