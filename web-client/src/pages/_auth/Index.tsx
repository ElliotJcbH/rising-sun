import React from "react";
import '@/styles/Index.css';
import { useNavigate } from "@tanstack/react-router";

const Index = () => {
    
    const navigate = useNavigate();

    const createAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email') as string,
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            confirmPassword: formData.get('confirmPassword') as string,
        };

        if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password
            })
        })
        
        if(!res.ok) throw new Error(`Account creation failed: ${res.status}`);

        const body = await res.json();
        localStorage.setItem('sessionInfo', JSON.stringify(body));

        navigate({ to: '/home' });
    } 

    return (
        <div>
            <form onSubmit={createAccount}>
                <label>
                    Email
                    <input type='email' name='email' required />
                </label>
                <label>
                    Username
                    <input type='text' name='username' required />
                </label>
                <label>
                    Password
                    <input type='password' name='password' required />
                </label>
                <label>
                    Confirm Password
                    <input type='password' name='confirmPassword' required />
                </label>
                <button type='submit'>Create Account</button>
            </form>
        </div>
    )

}

export default Index;