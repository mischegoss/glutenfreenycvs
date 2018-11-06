import React, { Component } from 'react';

// This uses logic found in Error Boundary tutorial
class ErrorBoundary extends Component {
    state = { hasError: false }

    componentDidCatch(error, info) {
        window.alert("Oops, something went wrong.")
        this.setState({ hasError: true })
    }

    render() {
        if (this.state.hasError) {
            return <h2>Something went wrong. Please try again.</h2>
        }
        return this.props.children
    }
}

export default ErrorBoundary;
