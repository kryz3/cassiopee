'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Contact() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState({
        submitted: false,
        message: '',
        error: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ submitted: false, message: '', error: false });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({
                    submitted: true,
                    message: 'Votre message a été envoyé avec succès! Une confirmation a été envoyée à votre adresse email.',
                    error: false
                });
                setFormData({ name: '', email: '', message: '' });
                
                // Redirect to homepage after successful submission
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setStatus({
                    submitted: true,
                    message: data.message || 'Une erreur est survenue. Veuillez réessayer.',
                    error: true
                });
            }
        } catch (error) {
            setStatus({
                submitted: true,
                message: 'Une erreur est survenue. Veuillez réessayer.',
                error: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Contactez-nous</h1>
                
                {status.submitted && (
                    <div className={`mb-4 p-3 rounded ${status.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {status.message}
                    </div>
                )}
                
                <p className="mb-4 text-center text-black">
                    Remplissez ce formulaire pour nous contacter. Une confirmation sera envoyée à votre adresse email.
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black">Nom</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" 
                            placeholder="Votre nom" 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" 
                            placeholder="Votre email" 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Message</label>
                        <textarea 
                            name="message" 
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" 
                            placeholder="Votre message" 
                            rows="4" 
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700 disabled:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
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