import React from 'react';
import './Navbar.css'; // Importing styles specific to Navbar

const Navbar = () => {
    return (
        <header className="navbar">
            <h1>My Website</h1>
            <nav>
                <ul className="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
