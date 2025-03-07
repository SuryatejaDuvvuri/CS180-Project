import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Signup from './Signup';

const renderSignup = () => {
    render(
        <BrowserRouter>
            <Signup />
        </BrowserRouter>
    );
};

test('renders signup form correctly', () => {
    renderSignup();

    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
});