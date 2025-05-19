import React from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { gradientBackground, gradientKeyframes } from '../theme';
import { useAppContext } from '../AppContext';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const WelcomeContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: '#0a0a0a',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 30%, rgba(184, 33, 54, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 80% 70%, rgba(0, 142, 147, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(248, 248, 248, 0.08) 0%, transparent 60%)
    `,
    animation: 'rotate 45s linear infinite',
    backgroundSize: '200% 200%',
    filter: 'blur(45px)',
    opacity: 0.9,
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  textShadow: '0 0 20px rgba(184, 33, 54, 0.5)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #B82136, transparent)',
    animation: 'glow 2s infinite',
  },
}));

const FeatureCard = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(184, 33, 54, 0.3)',
  },
}));

const CareerLink = styled('a')(({ theme }) => ({
  color: '#B82136',
  textDecoration: 'none',
  position: 'relative',
  padding: '4px 0',
  transition: 'all 0.3s ease',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #B82136, #008E93)',
    transform: 'scaleX(0)',
    transformOrigin: 'right',
    transition: 'transform 0.3s ease',
  },
  '&:hover': {
    color: '#008E93',
    '&::after': {
      transform: 'scaleX(1)',
      transformOrigin: 'left',
    },
  },
}));

const WelcomeScreen = () => {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const { setCurrentView, setIsLoading } = useAppContext();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const handleLoginClick = () => {
    setIsLoading(true);
    setCurrentView('auth');
    setIsLoading(false);
  };

  const features = [
    {
      title: 'Smart Workforce Management',
      description: 'AI-powered scheduling and optimization for your logistics operations',
      icon: '🤖',
    },
    {
      title: 'Real-time Analytics',
      description: 'Instant insights and data-driven decision making',
      icon: '📊',
    },
    {
      title: 'Secure & Efficient',
      description: 'Enterprise-grade security with seamless integration',
      icon: '🔒',
    },
  ];

  return (
    <WelcomeContainer>
      <style>{gradientKeyframes}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ opacity, scale }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box sx={{ mb: 4 }}>
                <img src="/logo.png" alt="FIEGE Logo" style={{ height: 60, marginBottom: 24 }} />
              </Box>
              <GlowingText variant="h1" sx={{ mb: 3, fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '4rem' } }}>
                Welcome to Vision Fiege
              </GlowingText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  mb: 6,
                  fontSize: { xs: '1.25rem', md: '1.75rem' },
                  maxWidth: '800px',
                  margin: '0 auto'
                }}
              >
                Transforming logistics through innovation and intelligent workforce management
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.4rem' },
                  maxWidth: '800px',
                  margin: '0 auto',
                  fontStyle: 'italic'
                }}
              >
                At FIEGE, we're not just a company - we're a family. This application is exclusively for our family members. 
                But don't worry! You can join our family too! 😉
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  mb: 6,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  maxWidth: '800px',
                  margin: '0 auto'
                }}
              >
                Want to be part of something special? Check out our{' '}
                <CareerLink 
                  href="https://www.fiege.com/pl/kariera" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  career opportunities
                </CareerLink>
                {' '}and become part of the FIEGE family!
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleLoginClick}
                sx={{
                  background: 'linear-gradient(45deg, #B82136 30%, #008E93 90%)',
                  boxShadow: '0 3px 15px rgba(184, 33, 54, 0.3)',
                  borderRadius: '30px',
                  padding: '16px 40px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #8f1a2a 30%, #006b6f 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 20px rgba(184, 33, 54, 0.4)',
                  },
                }}
              >
                Get Started
              </Button>
            </motion.div>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
              gap: 4,
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                >
                  <FeatureCard>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: '2.5rem' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </motion.div>
    </WelcomeContainer>
  );
};

export default WelcomeScreen; 