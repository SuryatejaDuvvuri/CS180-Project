import Dropdown from './Dropdown';
import GetMajors from './GetMajors';

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.
function Header() {
    const majorsArr = ["A", "B", "C", "D"];
    return (
        <div className="App">
            <div className="Header">
                <div className='Subcategory'>
                    <button className='Button'>View Profile</button>
                    <button className='Button'>+ Create Project</button>
                </div>
                <div className='Subcategory'>
                    <Dropdown title={"Filter..."} arr={GetMajors()} />
                    <input type="text" className='Button' />
                </div>
            </div>
            <div className='HeaderShadow' />
        </div>
    );
}

export default Header;