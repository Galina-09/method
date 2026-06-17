/**
 * Animation variants for page transitions
 */
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
};

/**
 * Animation variants for staggered children animations
 */
export const staggerContainerVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Animation variants for items in staggered containers
 */
export const staggerItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

/**
 * Animation variants for buttons
 */
export const buttonVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
  }
};

/**
 * Animation variants for form elements
 */
export const formElementVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

/**
 * Animation variants for cards
 */
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -10,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

/**
 * Animation variants for list items
 */
export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

/**
 * Animation variants for graphs
 */
export const graphVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 15,
      delay: 0.3
    }
  }
};

/**
 * Apply fade-in animation to body element
 */
export const applyBodyFadeIn = () => {
  document.body.classList.add('loaded');
};

/**
 * Apply fade-out animation to body element
 */
export const applyBodyFadeOut = () => {
  document.body.classList.remove('loaded');
};

export default {
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  buttonVariants,
  formElementVariants,
  cardVariants,
  listItemVariants,
  graphVariants,
  applyBodyFadeIn,
  applyBodyFadeOut
};