import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#f1f5f9',
            color: '#1e293b',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ background: '#fff', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 14 }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <p style={{ marginTop: 16 }}>
            If the dashboard shows only white, run it from the <code>dashboard</code> folder: <br />
            <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>cd dashboard && npm install && npm run dev</code>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
