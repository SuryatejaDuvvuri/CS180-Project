import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from './Login';

const renderLogin = () => {
    render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Login />
        </BrowserRouter>
    );
};

test('render login form', () => {
    renderLogin();

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('Null validation', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
});

test('invalid information', async () => {
    renderLogin();

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    fireEvent.change(emailInput, { target: { value: 'test@ucr.edu' } });
    fireEvent.change(passwordInput, { target: { value: '1234' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
});

test('successful login with correct credentials', async () => {
    renderLogin();

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    fireEvent.change(emailInput, { target: { value: 'test@ucr.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.queryByText(/email and password are required/i)).not.toBeInTheDocument();
});