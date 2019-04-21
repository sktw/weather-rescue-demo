import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {navigate} from '../actions/router';
import Nav from './Nav';
import Home from './Home';
import App from './App';

class Router extends React.Component {
    constructor(props) {
        super(props);
        this.handleNavigate = this.handleNavigate.bind(this);
    }

    handleNavigate() {
        this.props.dispatch(navigate(window.location.hash.substring(1)));
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleNavigate);
    }

    componentDidMount() {
        this.handleNavigate();
        window.addEventListener('hashchange', this.handleNavigate);
    }

    renderPage(route) {
        switch (route) {
            case '':
                return <Home />

            case 'classify':
                return <App />;

            default:
                return <div className="text-center font-md">Not found!</div>;
        }
    }

    render() {
        const {route} = this.props;

        const result = (
            <React.Fragment>
                <Nav route={route} />
                {this.renderPage(route)}
            </React.Fragment>
        );

        return result;
    }
}

Router.propTypes = {
    route: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(storeState) {
    const {router} = storeState;

    return {
        route: router.route
    };
}

export default connect(
    mapStateToProps
)(Router);
