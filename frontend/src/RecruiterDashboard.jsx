import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RecruiterDashboard() {
    const [data, setData] = useState({ active: [], rejected: [] });

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/applicants');
            setData(res.data);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => {
        fetchData();
        const inter = setInterval(fetchData, 5000);
        return () => clearInterval(inter);
    }, []);

    const rejectUser = async (id) => {
        if(window.confirm("Move this user to Rejected History and promote next?")) {
            await axios.delete(`http://localhost:5000/api/applicants/${id}/reject`);
            fetchData();
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{color: '#2d3436'}}>Recruiter Dashboard (Live Queue)</h2>
            <table border="1" width="100%" style={{borderCollapse: 'collapse', marginBottom: '50px'}}>
                <thead style={{background: '#f4f4f4'}}>
                    <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Queue Pos</th><th>Ack?</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {data.active.map(app => (
                        <tr key={app.id}>
                            <td style={{textAlign: 'center'}}>{app.id}</td>
                            <td>{app.name}</td><td>{app.email}</td>
                            <td style={{color: app.status === 'ACTIVE' ? 'green' : 'orange', fontWeight: 'bold'}}>{app.status}</td>
                            <td style={{textAlign: 'center'}}>{app.queue_position || '-'}</td>
                            <td style={{textAlign: 'center'}}>{app.acknowledged ? '✅' : '❌'}</td>
                            <td style={{textAlign: 'center'}}>
                                <button onClick={() => rejectUser(app.id)} style={{color: 'red', cursor: 'pointer'}}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 style={{color: '#d63031'}}>Rejected Users History</h2>
            <table border="1" width="100%" style={{borderCollapse: 'collapse'}}>
                <thead style={{background: '#ffeaa7'}}>
                    <tr><th>Original ID</th><th>Name</th><th>Email</th><th>Rejected Date</th></tr>
                </thead>
                <tbody>
                    {data.rejected.length > 0 ? data.rejected.map(rej => (
                        <tr key={rej.id}>
                            <td style={{textAlign: 'center'}}>{rej.id}</td>
                            <td>{rej.name}</td><td>{rej.email}</td>
                            <td>{new Date(rej.rejected_at).toLocaleString()}</td>
                        </tr>
                    )) : <tr><td colSpan="4" style={{textAlign:'center', padding: '10px'}}>No rejected users yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}