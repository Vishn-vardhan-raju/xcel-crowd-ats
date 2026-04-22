import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trash2 } from 'lucide-react';

export default function RecruiterDashboard() {
    const [list, setList] = useState([]);
    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/recruiter/applicants/6');
            setList(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const reject = async (id) => {
        await axios.patch(`http://localhost:5000/api/applicants/${id}/status`, { status: 'REJECTED' });
        fetchData();
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h2><Users/> Recruiter Dashboard</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{background: '#f4f4f4'}}>
                    <tr><th>Name</th><th>Status</th><th>Queue Pos</th><th>Ack?</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {list.map(u => (
                        <tr key={u.id}>
                            <td>{u.name}<br/><small>{u.email}</small></td>
                            <td style={{color: u.status === 'ACTIVE' ? 'green' : 'orange', fontWeight: 'bold'}}>{u.status}</td>
                            <td>{u.queue_position || '--'}</td>
                            <td>{u.acknowledged ? '✅' : '⏳'}</td>
                            <td><button onClick={() => reject(u.id)} style={{color: 'red', cursor: 'pointer'}}><Trash2 size={14}/> Reject</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}