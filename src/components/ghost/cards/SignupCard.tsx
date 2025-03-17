import React, { useState } from 'react';

export interface SignupCardProps {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  disclaimer?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  className?: string;
  onSubmit?: (email: string) => Promise<void>;
}

const SignupCard: React.FC<SignupCardProps> = ({
  heading = 'Sign up for our newsletter',
  subheading = 'Get the latest updates delivered to your inbox',
  buttonText = 'Subscribe',
  disclaimer = 'No spam. Unsubscribe anytime.',
  backgroundColor = '#F0F0F0',
  textColor = '#000000',
  buttonColor,
  buttonTextColor = '#FFFFFF',
  className = '',
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(email);
        setSuccess(true);
      } else {
        // Default behavior if no onSubmit handler is provided
        console.log('Signup form submitted with email:', email);
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`kg-card kg-signup-card kg-width-wide ${className}`}
      style={{ backgroundColor }}
    >
      <div className="kg-signup-card-content">
        <div className="kg-signup-card-text">
          <h2 className="kg-signup-card-heading" style={{ color: textColor }}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{heading}</span>
          </h2>
          <p className="kg-signup-card-subheading" style={{ color: textColor }}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{subheading}</span>
          </p>

          <form className="kg-signup-card-form" onSubmit={handleSubmit}>
            <div className="kg-signup-card-fields">
              <input
                className="kg-signup-card-input"
                id="email"
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
              />
              <button
                className="kg-signup-card-button kg-style-accent"
                style={{ color: buttonTextColor, backgroundColor: buttonColor }}
                type="submit"
                disabled={isLoading || success}
              >
                <span className={`kg-signup-card-button-${isLoading ? 'loading' : 'default'}`}>
                  {isLoading ? (
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                      <g strokeLinecap="round" strokeWidth="2" fill="currentColor" stroke="none" strokeLinejoin="round" className="nc-icon-wrapper">
                        <g className="nc-loop-dots-4-24-icon-o">
                          <circle cx="4" cy="12" r="3"></circle>
                          <circle cx="12" cy="12" r="3"></circle>
                          <circle cx="20" cy="12" r="3"></circle>
                        </g>
                      </g>
                    </svg>
                  ) : buttonText}
                </span>
              </button>
            </div>
            {success && (
              <div className="kg-signup-card-success" style={{ color: textColor }}>
                Email sent! Check your inbox to complete your signup.
              </div>
            )}
            {error && (
              <div className="kg-signup-card-error" style={{ color: textColor }}>
                {error}
              </div>
            )}
          </form>

          <p className="kg-signup-card-disclaimer" style={{ color: textColor }}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{disclaimer}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupCard;
