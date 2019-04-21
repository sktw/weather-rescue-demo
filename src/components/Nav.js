import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';
import {getUrl} from '../zooniverse';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {navbarCollapsed: true};
        this.handleNavbarToggle = this.handleNavbarToggle.bind(this);
    }

    handleNavbarToggle() {
        this.setState({navbarCollapsed: !this.state.navbarCollapsed});
    }

    renderItem(url, title) {
        const {route} = this.props;

        const className = classList([
            ['nav-item', true],
            ['active', url === '#' + route]
        ]);

        return (
            <li className={className}>
                <a className="nav-link" href={url}>{title}</a>
            </li>
        );
    }

    render() {
        const {navbarCollapsed} = this.state;
        const className = classList([
            ["navbar-collapse justify-content-end", true],
            ["collapse", navbarCollapsed]
        ]);

        getUrl;

        return (
            <nav className="navbar navbar-expand-md navbar-light bg-light" role="navigation">
                <a className="navbar-brand" href="#">Weather Rescue DEMO</a>
                <button className="navbar-toggler" type="button" onClick={this.handleNavbarToggle}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={className}>
                    <ul className="navbar-nav">
                        {this.renderItem('#', 'Home')}
                        {this.renderItem(getUrl('/about'), 'About')}
                        {this.renderItem('#classify', 'Classify')}
                        {this.renderItem(getUrl('/talk'), 'Talk')}
                        {this.renderItem(getUrl('/stats'), 'Stats')}
                    </ul>
                </div>
            </nav>
        );
    }
}

Nav.propTypes = {
    route: PropTypes.string.isRequired
};

export default Nav;
