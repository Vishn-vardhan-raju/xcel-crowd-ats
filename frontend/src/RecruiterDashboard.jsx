import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trash2, Activity } from 'lucide-react';

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
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const reject = async (id) => {
        await axios.patch(`http://localhost:5000/api/applicants/${id}/status`, { status: 'REJECTED' });
        fetchData();
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
            <h1 style={{display: 'flex', alignItems: 'center', gap: '15px'}}><Activity color="#4834d4"/> Recruiter Control Center</h1>
            <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{background: '#f8f9fa'}}>
                        <tr>
                            <th style={{padding: '15px', textAlign: 'left'}}>Candidate</th>
                            <th style={{padding: '15px', textAlign: 'left'}}>Status</th>
                            <th style={{padding: '15px', textAlign: 'left'}}>Queue</th>
                            <th style={{padding: '15px', textAlign: 'left'}}>Ack?</th>
                            <th style={{padding: '15px', textAlign: 'left'}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(u => (
                            <tr key={u.id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '15px'}}>{u.name}<br/><small style={{color: '#7f8c8d'}}>{u.email}</small></td>
                                <td style={{padding: '15px'}}><span style={{color: u.status === 'ACTIVE' ? 'green' : 'orange', fontWeight: 'bold'}}>{u.status}</span></td>
                                <td style={{padding: '15px'}}>{u.queue_position || '--'}</td>
                                <td style={{padding: '15px'}}>{u.acknowledged ? '✅' : '⏳'}</td>
                                <td style={{padding: '15px'}}>
                                    <button onClick={() => reject(u.id)} style={{background: '#ff7675', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer'}}>
                                        <Trash2 size={16}/> Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}