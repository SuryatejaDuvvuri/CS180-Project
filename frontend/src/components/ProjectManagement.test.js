import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectManagement from '../ProjectManagement';

const renderProjectManagement = () => {
    render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ProjectManagement />
        </BrowserRouter>
    );
};

test('renders project management interface correctly', () => {
    renderProjectManagement();
    expect(screen.getByText(/Project Management/i)).toBeInTheDocument();
});