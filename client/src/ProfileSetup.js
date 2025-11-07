import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

const SUBJECT_LIBRARY = [
  'Algebra','Geometry','Calculus','Statistics','Physics','Chemistry','Biology',
  'English','History','Economics','Computer Science','Spanish','French'
];

export default function ProfileSetup({ user, onSaved }) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState(user?.name || '');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  // Load existing profile if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`/api/profile/${user.id}`);
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setRole(p.role || 'student');
          setName(p.name || user.name || '');
          setSchool(p.school || '');
          setMajor(p.major || '');
          setGrade(p.grade || '');
          setHourlyRate(p.hourly_rate || '');
          setSubjects(p.subjects || []);
          setBio(p.bio || '');
          setPhotoUrl(p.photo_url || '');
        }
      } catch (err) {
        console.log('No existing profile or error loading:', err);
      }
    };
    loadProfile();
  }, [user]);

  const toggleSubject = (s) => {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const uploadPhoto = async (file) => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    if (!user?.id) {
      alert('User ID not found. Please log in again.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading to:', filePath);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      setPhotoUrl(urlData.publicUrl);
      alert('Photo uploaded successfully!');
      
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await uploadPhoto(f);
  };

  const saveProfile = async () => {
    // Validation
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (role === 'tutor' && subjects.length === 0) {
      alert('Please select at least one subject you can tutor');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: user.id,
        role,
        name: name.trim(),
        school: school.trim(),
        major: major.trim(),
        grade: grade.trim(),
        hourly_rate: role === 'tutor' && hourlyRate ? Number(hourlyRate) : null,
        subjects,
        photo_url: photoUrl || null,
        bio: bio.trim()
      };

      console.log('Saving profile:', payload);

      const res = await axios.post('/api/profile', payload);
      
      if (res.data.success) {
        alert('Profile saved successfully!');
        onSaved?.(res.data.profile);
      } else {
        alert(res.data.message || 'Save failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup">
      <h2>Create / Update Profile</h2>

      <div className="form-group">
        <label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student (Looking for tutoring)</option>
          <option value="tutor">Tutor (Offering tutoring)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
      </div>

      <div className="form-group">
        <label>School</label>
        <select value={school} onChange={e => setSchool(e.target.value)}>
          <option value="">Select school...</option>
          <option value="Spelman College">Spelman College</option>
          <option value="Morehouse College">Morehouse College</option>
          <option value="Clark Atlanta University">Clark Atlanta University</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Major</label>
        <input value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g., Biology, Computer Science" />
      </div>

      <div className="form-group">
        <label>Grade/Year</label>
        <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g., Freshman, Sophomore, Junior, Senior" />
      </div>

      {role === 'tutor' && (
        <div className="form-group">
          <label>Hourly Rate (USD) *</label>
          <input 
            type="number" 
            value={hourlyRate} 
            onChange={e => setHourlyRate(e.target.value)} 
            placeholder="e.g., 30" 
            min="0"
            step="5"
          />
        </div>
      )}

      <div className="form-group">
        <label>{role === 'tutor' ? 'Subjects I Can Tutor *' : 'Subjects I Need Help With'}</label>
        <div className="chips">
          {SUBJECT_LIBRARY.map(s => (
            <button
              key={s}
              type="button"
              className={`chip ${subjects.includes(s) ? 'selected' : ''}`}
              onClick={() => toggleSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Profile Photo</label>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileRef} 
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p className="upload-status">Uploading...</p>}
        {photoUrl && (
          <div className="photo-preview">
            <img src={photoUrl} alt="avatar" />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Bio</label>
        <textarea 
          value={bio} 
          onChange={e => setBio(e.target.value)} 
          rows={4} 
          placeholder={role === 'tutor' 
            ? "Tell students about your tutoring experience, teaching style, and what makes you a great tutor..." 
            : "Tell tutors a bit about yourself and what you're looking for help with..."
          }
        />
      </div>

      <button 
        className="save-btn" 
        onClick={saveProfile} 
        disabled={saving || uploading}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}