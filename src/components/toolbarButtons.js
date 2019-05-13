import React from 'react';
import {classList} from '../utils';
import {renderWithProps} from './componentUtils';
import PropTypes from 'prop-types';

export function MenuButton(props) {
    const {title, iconClass = '', disabled=false, onClick} = props;
    let contents;

    if (iconClass === '') {
        contents = title;
    }
    else {
        const className = classList([
            ['fa', true],
            [iconClass, true]
        ]);

        contents = <i className={className}></i>;
    }

    return (
        <button 
            className="menu-button"
            type="button"
            onClick={onClick} 
            title={title}
            disabled={disabled}
        >{contents}</button>
    );
}

MenuButton.propTypes = {
    title: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    iconClass: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

export function ToolButton(props) {
    const {value, title, tool, iconClass = '', onClick} = props;
    let contents;

    if (iconClass === '') {
        contents = title;
    }
    else {
        const className = classList([
            ['fa fa-fw', true],
            [iconClass, true]
        ]);

        contents = <i className={className}></i>;
    }

    const className = classList([
        ['menu-button tool-button', true], 
        ['active', value === tool]
    ]);

    return (
        <button 
            className={className} 
            type="button"
            onClick={() => onClick(value)} 
            title={title}
        >{contents}</button>
    );
}

ToolButton.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    iconClass: PropTypes.string,
    tool: PropTypes.string,
    onClick: PropTypes.func
};

export function ButtonGroup(props) {
    const {separatorLeft = false, separatorRight = false} = props;


    const className = classList([
        ["menu-button-group", true],
        ["menu-separator-left", separatorLeft],
        ["menu-separator-right", separatorRight]
    ]);

    return (
        <div className={className}>
            {props.children}
        </div>
    );
}

ButtonGroup.propTypes = {
    children: PropTypes.any,
    separatorLeft: PropTypes.bool,
    separatorRight: PropTypes.bool
};

export function ToolButtonContainer(props) {
    const {tool, onChange} = props;

    return (
        <React.Fragment>
            {renderWithProps(props.children, {tool, onClick: onChange})}
        </React.Fragment>
    );
}

ToolButtonContainer.propTypes = {
    tool: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.any,
};
