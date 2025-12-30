
import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-[#f5f3ff] via-[#faf5ff] to-white border-t border-[#ede9fe] mt-[2rem]">
      <div className="max-w-[1600px] mx-auto pt-[2rem] px-[1rem] pb-[5rem] lg:px-[3.5rem] lg:pb-[3rem]">
        
        {/* Mobile Layout */}
        <div className="flex flex-col items-center text-center lg:hidden gap-[1.5rem]">
          <a href="#" className="inline-block no-underline">
            <h2 className="text-[1.5rem] font-[900] tracking-[-0.02em] text-[#111827] font-sans">
              FLAME<span className="text-[#7c3aed]">.</span>
            </h2>
          </a>
          <p className="text-[0.875rem] text-[#4b5563] max-w-[20rem]">Your trusted marketplace for premium digital products and services.</p>
          
          <div className="flex flex-wrap justify-center gap-[1rem] text-[0.875rem]">
            <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Privacy Policy</a>
            <span className="text-[#d1d5db]">•</span>
            <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Terms & Conditions</a>
            <span className="text-[#d1d5db]">•</span>
            <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Refund Policy</a>
          </div>

          <div className="flex gap-[0.75rem]">
            <SocialIconMobile icon="ri-facebook-fill" />
            <SocialIconMobile icon="ri-messenger-fill" />
            <SocialIconMobile icon="ri-whatsapp-fill" />
            <SocialIconMobile icon="ri-phone-fill" />
          </div>

          <p className="text-[0.75rem] text-[#4b5563]">© {year} <span className="font-[600] text-[#111827]">FLAME Inc.</span> All rights reserved.</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between gap-[3rem] pb-[3rem] border-b border-[#e5e7eb]">
            <div className="shrink-0 w-[20rem]">
              <a href="#" className="inline-block mb-[1rem]">
                <h2 className="text-[1.5rem] font-[900] tracking-[-0.02em] text-[#111827] font-sans">
                  FLAME<span className="text-[#7c3aed]">.</span>
                </h2>
              </a>
              <p className="text-[1rem] text-[#4b5563] leading-[1.625]">
                Your trusted marketplace for premium digital products and services. Quality tools for modern creators.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-[3rem] flex-1">
              <FooterColumn title="Explore">
                <FooterLink href="#">All Products</FooterLink>
                <FooterLink href="#">AI Tools</FooterLink>
                <FooterLink href="#">Design Tools</FooterLink>
                <FooterLink href="#">Entertainment</FooterLink>
                <FooterLink href="#">Productivity</FooterLink>
              </FooterColumn>

              <FooterColumn title="Policies">
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Terms of Service</FooterLink>
                <FooterLink href="#">Refund Policy</FooterLink>
                <FooterLink href="#">Shipping Policy</FooterLink>
              </FooterColumn>

              <div className="flex flex-col gap-[1rem]">
                <h4 className="text-[0.875rem] font-[700] text-[#111827] uppercase tracking-[0.05em] mb-[1rem]">Contact Us</h4>
                <ul className="list-none flex flex-col gap-[0.75rem]">
                  <li><a href="#" className="text-[0.875rem] text-[#4b5563] hover:text-[#7c3aed] transition-colors">Contact Page</a></li>
                  <li><a href="#" className="text-[0.875rem] text-[#4b5563] hover:text-[#7c3aed] transition-colors">Help Center</a></li>
                </ul>
                <div>
                  <p className="text-[0.875rem] font-[600] text-[#111827] mb-[0.75rem] pt-[0.5rem]">Follow Us</p>
                  <div className="flex flex-wrap gap-[0.75rem]">
                    <SocialIconDesktop icon="ri-facebook-fill" />
                    <SocialIconDesktop icon="ri-messenger-fill" />
                    <SocialIconDesktop icon="ri-whatsapp-fill" />
                    <SocialIconDesktop icon="ri-phone-fill" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-[2rem]">
            <p className="text-[0.875rem] text-[#4b5563]">© {year} <span className="font-[600] text-[#111827]">FLAME Inc.</span> All rights reserved.</p>
            <div className="flex items-center gap-[1.5rem] text-[0.875rem]">
              <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Privacy</a>
              <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Terms</a>
              <a href="#" className="text-[#4b5563] hover:text-[#7c3aed] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-[1rem]">
    <h4 className="text-[0.875rem] font-[700] text-[#111827] uppercase tracking-[0.05em] mb-[1rem]">{title}</h4>
    <ul className="list-none flex flex-col gap-[0.75rem]">
      {children}
    </ul>
  </div>
);

const FooterLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <a href={href} className="text-[0.875rem] text-[#4b5563] hover:text-[#7c3aed] transition-colors">
      {children}
    </a>
  </li>
);

const SocialIconMobile: React.FC<{ icon: string }> = ({ icon }) => (
  <a 
    href="#" 
    className="w-[2.5rem] h-[2.5rem] rounded-full border-[2px] border-[#d1d5db] flex items-center justify-center text-[#4b5563] transition-all duration-300 hover:border-[#7c3aed] hover:text-[#7c3aed]"
  >
    <i className={`${icon} text-[1.125rem]`}></i>
  </a>
);

const SocialIconDesktop: React.FC<{ icon: string }> = ({ icon }) => (
  <a 
    href="#" 
    className="w-[2.5rem] h-[2.5rem] rounded-[0.5rem] border-[2px] border-[#d1d5db] flex items-center justify-center text-[#4b5563] transition-all duration-300 hover:border-[#7c3aed] hover:text-[#7c3aed]"
  >
    <i className={`${icon} text-[1.125rem]`}></i>
  </a>
);

export default Footer;
