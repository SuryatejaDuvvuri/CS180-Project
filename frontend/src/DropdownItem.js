import React from 'react';
import Dropdown from './Dropdown.js';
import './Dropdown.css';

// A single element in the dropdown menu
class DropdownItem extends React.Component {
    /* this.props.getIsOpenMethod: assigned the GetIsOpen() function from Dropdown; is used to toggle the display of the DropdownItems
       this.props.addChosenElem: assigned the addCategory() function from ProjectCreation; is used to update the array in ProjectCreation if an item is checked
       this.props.removeChosenElem: assigned the removeCategory() function from ProjectCreation; is used to update the array in ProjectCreation if an item is unchecked
       this.state.checkmark: toggles betwee [] and [✓]
       this.state.isOpen: keeps track of whether the dropdown menu is open
    */
    constructor(props) {
        super(props);
        this.state = { checkmark: "[]" }
        this.state.isOpen = this.props.isOpen
    }

    /* Triggers if a DropdownItem is pressed.
       If the item is selected, it will change this.state.checkmark to [✓].
       Otherwise it'll make the box empty.
    */
    handleItemClick = () => {
        this.state.clicked ? this.setState({ checkmark: "[✓]" }) : this.setState({ checkmark: "[]" });
        this.setState({ clicked: !this.state.clicked });
        if(this.state.checkmark != "[✓]")
            this.props.addChosenElem(this.props.text);
        else
            this.props.removeChosenElem(this.props.text);
    }

    /* Triggers at the beginning of the program.
       HACK: This method reuses the same code in handleItemClick. Without it, the boxes will not appear
             in the dropdown menu until you click on a DropdownItem.
    */
    componentDidMount() {
        this.state.clicked ? this.setState({ checkmark: "[✓]" }) : this.setState({ checkmark: "[]" });
        this.setState({ clicked: !this.state.clicked });
    }

    // Returns this.props.getIsOpenMethod(), which calls Dropdown.GetIsOpen().
    getIsOpenValue() {
        return this.props.getIsOpenMethod();
    }

    render() {
        // If the dropdown menu isn't open, hide the display of the DropdownItems.
        // Otherwise, show the DropdownItems.
        const styles = {
            display: this.getIsOpenValue() ? "flex" : "none",
        }

        return (
            <div>
                <a style={styles} onClick={this.handleItemClick}>
                    {this.state.checkmark}
                    {/*Separator to create space in the case that the checkmark box is empty. Spacing will be off otherwise*/}
                    {this.state.clicked && (<i className="fas fa-home"></i>)}
                    {/*Separator to create space between checkmark box and text*/}
                    <i className="fas fa-home"></i>
                    {this.props.text}
                </a>
            </div>
        );
    }
}

export default DropdownItem;