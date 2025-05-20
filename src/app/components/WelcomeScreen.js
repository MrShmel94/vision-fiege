"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Container, Link } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { gsap } from 'gsap';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import SecurityIcon from '@mui/icons-material/Security';
import dynamic from 'next/dynamic';
import { useAppContext } from '../AppContext';
import animationData from '../resources/ai-orb-loading.json';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const glowLine = keyframes`
  0%,100% { transform: scaleX(0); }
  50% { transform: scaleX(1); }
`;

const Background = styled(Box)(() => ({
  position: 'fixed', inset: 0,
  background: 'linear-gradient(135deg, #B82136 0%, #008E93 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 10s ease infinite`,
  filter: 'blur(1px)',
  zIndex: -1,
  pointerEvents: 'none',
}));

const Content = styled(Container)(() => ({
  position: 'relative', zIndex: 1,
  minHeight: '100vh',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '2rem', color: '#fff',
}));

const GlowingText = styled(Typography)(() => ({
  textShadow: '0 0 20px rgba(255,255,255,0.6)', position: 'relative',
  '&::after': {
    content: '""', position: 'absolute', bottom: -6, left: 0, width: '100%', height: '3px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0))',
    transform: 'scaleX(0)', transformOrigin: 'center', animation: `${glowLine} 2s ease-in-out infinite`,
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px',
  padding: theme.spacing(4), margin: theme.spacing(2), textAlign: 'center',
  border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s ease',
  '&:hover': { transform: 'translateY(-8px)' },
}));

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function WelcomeScreen() {
  const { setCurrentView, setIsLoading } = useAppContext();
  const [loading, setLoading] = useState(true);

  const introRef = useRef(null);
  const cardsRef = useRef([]);
  cardsRef.current = [];
  const addCard = el => { if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el); };

  useEffect(() => {
    if (document.readyState === 'complete') {
      setLoading(false);
    } else {
      const onLoad = () => setLoading(false);
      window.addEventListener('load', onLoad);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => {
        window.removeEventListener('load', onLoad);
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (!loading && introRef.current) {
      const elems = Array.from(introRef.current.children);
      gsap.from(elems, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.2,
      });
      cardsRef.current.forEach(card => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        });
      });
    }
  }, [loading]);

  const handleLogin = () => {
    setIsLoading(true);
    setCurrentView('auth');
    setIsLoading(false);
  };

  const features = [
    { icon: <SmartToyIcon sx={{ fontSize: 48, mb: 1 }} />, title: 'Smart Workforce Management', desc: 'AI-powered scheduling and optimization for your logistics operations' },
    { icon: <InsertChartIcon sx={{ fontSize: 48, mb: 1 }} />, title: 'Real-time Analytics', desc: 'Instant insights and data-driven decision making' },
    { icon: <SecurityIcon sx={{ fontSize: 48, mb: 1 }} />, title: 'Secure & Efficient', desc: 'Enterprise-grade security with seamless integration' },
  ];

  return (
    <>
      {loading && (
        <Box sx={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Lottie animationData={animationData} loop autoplay style={{ width: 200, height: 200 }} />
        </Box>
      )}

      <Background />
      <Content ref={introRef}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img src="/logo.png" alt="FIEGE Logo" style={{ height: 60, marginBottom: 24 }} />
        </Box>
        <GlowingText variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
          Welcome to Vision Fiege
        </GlowingText>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', maxWidth: 600 }}>
          Transforming logistics through innovation and intelligent workforce management
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', maxWidth: 600 }}>
          At FIEGE, we're not just a company - we're a family. This application is exclusively for our family members.<br />But don't worry! You can join our family too! 😉
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          sx={{
            background: 'linear-gradient(45deg, #B82136 30%, #008E93 90%)',
            boxShadow: '0 3px 15px rgba(184,33,54,0.3)',
            borderRadius: '30px', padding: '16px 40px', fontSize: '1.2rem', fontWeight: 600, textTransform: 'none', mb: 2,
            '&:hover': { background: 'linear-gradient(45deg, #8f1a2a 30%, #006b6f 90%)', transform: 'translateY(-2px)', boxShadow: '0 5px 20px rgba(184,33,54,0.4)' },
          }}
        >Get Started</Button>
        <Typography sx={{ mb: 4, textAlign: 'center' }}>
          Looking for a career at FIEGE?{' '}
          <Link href="https://www.fiege.com/pl/kariera" target="_blank" underline="always" sx={{ color: '#fff', fontWeight: 600 }}>
            Explore Opportunities
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {features.map((f, i) => (
            <FeatureCard key={i} ref={addCard}>
              {f.icon}
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>{f.title}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{f.desc}</Typography>
            </FeatureCard>
          ))}
        </Box>
      </Content>
    </>
  );
}
