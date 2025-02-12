export const getHelloWorld = async () => {
    const response = await fetch('http://localhost:8000/api/hello/');
    return await response.json();
};
