import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectCreation from '../ProjectCreation';

const renderProjectCreation = () => {
    render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ProjectCreation />
        </BrowserRouter>
    );
};

jest.mock('firebase/auth', () => ({
    getAuth: () => ({
        currentUser: {
            email: 'test@ur.edu',
            getIdToken: () => Promise.resolve('fakeToken'),
        },
    }),
    setPersistence: () => Promise.resolve(),
    GoogleAuthProvider: jest.fn(() => ({}))
}));

test('renders project creation form', () => {
    renderProjectCreation();

    expect(screen.getByText(/Create a New Project/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
});

test('require all fields', async () => {
    renderProjectCreation();

    fireEvent.click(screen.getByRole('button', { name: /Create Project/i }));
    expect(await screen.findByText(/Please fill all required fields/i)).toBeInTheDocument();
});
