import { useEffect, useState } from 'react';
import { getHelloWorld } from '../api/helloworld';

const HelloWorld = () => {
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHelloWorld();
                setMessage(data.message);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <h1 className="text-2xl font-bold text-center text-blue-600">{message}</h1>
    );
};

export default HelloWorld;
