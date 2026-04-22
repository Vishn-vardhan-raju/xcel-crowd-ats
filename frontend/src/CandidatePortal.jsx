import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Search, CheckCircle } from 'lucide-react';

export default function CandidatePortal() {
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });

    const apply = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/apply', { ...form, jobId: 6 });
            alert("Application Submitted! Use the status check below.");
        } catch (err) { alert("Error applying."); }
    };

    const checkStatus = async () => {
        const res = await axios.get(`http://localhost:5000/api/status/${email}`);
        setStatusData(res.data);
    };

    const acknowledge = async () => {
        await axios.post(`http://localhost:5000/api/applicants/${statusData.id}/acknowledge`);
        alert("Spot Confirmed!");
        checkStatus();
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{color: '#4834d4'}}>Candidate Portal</h1>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3><UserPlus size={20}/> New Application</h3>
                <form onSubmit={apply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input style={{padding: '10px'}} placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} required />
                    <input style={{padding: '10px'}} placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
                    <button style={{padding: '10px', background: '#4834d4', color: 'white', border: 'none', cursor: 'pointer'}} type="submit">Apply Now</button>
                </form>
            </div>

            <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3><Search size={20}/> Check My Status</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input style={{flex: 1, padding: '10px'}} placeholder="Enter Registered Email" onChange={e => setEmail(e.target.value)} />
                    <button onClick={checkStatus}>Check</button>
                </div>

                {statusData && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <p>Current Status: <b style={{color: statusData.status === 'ACTIVE' ? 'green' : 'orange'}}>{statusData.status}</b></p>
                        {statusData.status === 'WAITLISTED' && <p>Queue Position: <b>#{statusData.queue_position}</b></p>}
                        {statusData.status === 'ACTIVE' && !statusData.acknowledged && (
                            <button onClick={acknowledge} style={{ width: '100%', padding: '10px', background: '#2ecc71', color: 'white', border: 'none', fontWeight: 'bold' }}>
                                <CheckCircle size={16}/> CONFIRM MY POSITION
                            </button>
                        )}
                        {statusData.acknowledged && <p style={{color: '#2ecc71'}}>✓ You have confirmed your spot.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}