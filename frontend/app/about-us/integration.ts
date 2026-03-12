const UseGetIntegration = async () => {
    try {
        const response = await fetch('/api/integration', {
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' } 
        });
        return response;
    } catch (error) {
        console.error('Integration fetch error:', error);
        throw error;
    }
}

export default UseGetIntegration;

    