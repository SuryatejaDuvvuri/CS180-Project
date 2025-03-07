import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectCreation from '../ProjectCreation';

const renderProjectCreation = () => {
    render(
        <BrowserRouter>
            <ProjectCreation />
        </BrowserRouter>
    );
};

test('renders project creation form', () => {
    renderProjectCreation();

    expect(screen.getByText(/Create a New Project/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
});