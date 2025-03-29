'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfileSettings() {
  interface Profile {
    username: string;
    email: string;
    bio: string;
    avatar: string;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (response.ok) {
          setProfile({
            username: data.profile.username,
            email: data.profile.email,
            bio: data.profile.bio || '',
            avatar: data.profile.avatar || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: profile?.bio }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully!');
        setProfile(prev => (prev ? { ...prev, ...data.profile } : prev));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  if (!isClient || !profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-xl font-semibold'>Profile</h2>
        <p className='text-sm text-muted-foreground'>Update your personal information.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row gap-6'>
             
              <div className='flex-1 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='username'>Full Name</Label>
                    <Input id='username' name='username' value={profile.username} onChange={handleChange} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' name='email' type='email' value={profile.email} disabled />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea id='bio' name='bio' value={profile.bio} onChange={handleChange} rows={4} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit'>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
