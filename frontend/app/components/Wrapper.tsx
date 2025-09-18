import { Box, BoxProps } from '@chakra-ui/react';

interface WrapperProps extends BoxProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'section' | 'container';
}

const Wrapper = ({ 
  children, 
  size = 'lg', 
  variant = 'default',
  ...props 
}: WrapperProps) => {
  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return { base: '100%', sm: '540px' };
      case 'md': return { base: '100%', sm: '720px' };
      case 'lg': return { base: '100%', sm: '960px' };
      case 'xl': return { base: '100%', sm: '1140px' };
      case 'full': return '100%';
      default: return { base: '100%', sm: '960px' };
    }
  };

  const getPadding = () => {
    switch (variant) {
      case 'section': return { base: 6, sm: 8, md: 12 };
      case 'container': return { base: 4, sm: 6, md: 8 };
      default: return { base: 4, sm: 6, md: 8 };
    }
  };

  return (
    <Box
      maxW={getMaxWidth()}
      mx="auto"
      px={getPadding()}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Wrapper;``