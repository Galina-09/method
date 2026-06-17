import React, { Component } from 'react';
import { fixCommonErrors } from '../utils/debugHelper';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Перехоплена помилка:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }
  
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Get error analysis
      const analysis = fixCommonErrors(this.state.error?.message || '');
      
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary">
            <h2>Виникла помилка</h2>
            <div className="error-details">
              <p className="error-message">{this.state.error?.message}</p>
              
              {analysis.identified && (
                <div className="error-diagnosis">
                  <p><strong>Діагноз:</strong> {analysis.diagnosis}</p>
                  <p><strong>Вирішення:</strong> {analysis.fix}</p>
                </div>
              )}
              
              <div className="error-stack">
                <p><strong>Стек компонентів:</strong></p>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </div>
            </div>
            
            <button onClick={this.resetErrorBoundary} className="error-reset-btn">
              Спробувати знову
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;