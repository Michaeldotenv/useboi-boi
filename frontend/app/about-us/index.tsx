"use client";

import type React from "react";
import { useState } from "react";

interface SaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
          Save Changes ?
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Are you sure you want to save this new change? Kindly note that this
          current changes would override the previous changes / Data
        </p>

        <div className="text-sm text-gray-500 mb-6">
          <div className="mb-1">
            Policy Title <span className="text-red-600">*</span>
          </div>
          <div className="font-medium text-gray-700">Privacy Policy</div>
          <div className="text-xs text-gray-400 mt-1">
            Not more than 40 characters
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-[#010133] text-white py-3 rounded-3xl font-medium mb-3 hover:bg-[#010133] transition-colors"
        >
          Save new Changes
        </button>

        <button
          onClick={onCancel}
          className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-3xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
          New Changes Saved
        </h2>

        <p className="text-center text-gray-600 mb-8">
          New Changes saved and updated successfully.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#010133] text-white py-3 rounded-3xl font-medium hover:bg-[#010133] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const PriceClaimDetails: React.FC = () => {
  const [content, setContent] =
    useState(`<div style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.6; color: #374151;">
<p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5;">
  <strong style="color: #111827;">Effective Date:</strong> 
  <strong style="color: #6366F1;">May 23, 2025</strong>
  <span style="margin: 0 24px; color: #9CA3AF;">|</span>
  <strong style="color: #111827;">Last Updated:</strong> 
  <strong style="color: #6366F1;">May 23, 2025</strong>
</p>

<p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6; font-size: 14px;">
  This Prize Claim Policy outlines the procedures and terms under which winners of the WinIT raffle platform can claim their prizes. It is important for all participants to read and understand this policy to ensure a smooth and transparent prize redemption process.
</p>

<p style="font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">Eligibility for Prize Claim</p>

<ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.6; font-size: 14px;">
  <li style="margin-bottom: 8px;">Only individuals who are 18 years or older and reside in Lagos State, Nigeria, are eligible to claim prizes.</li>
  <li style="margin-bottom: 8px;">Winners must present valid identification (e.g., National ID, Driver's License, or International Passport) to verify their identity.</li>
</ul>

<p style="font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">Notification of Winners</p>

<ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.6; font-size: 14px;">
  <li style="margin-bottom: 8px;">Winners will be notified via SMS and/or email using the contact details provided during ticket purchase.</li>
  <li style="margin-bottom: 8px;">Notifications will be sent within 3 hours of the draw conclusion.</li>
  <li style="margin-bottom: 8px;">Winners' names and locations will also be published on the WinIT website and social media platforms.</li>
</ul>

<p style="font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">Claim Process</p>

<ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; line-height: 1.6; font-size: 14px;">
  <li style="margin-bottom: 8px;">To claim a prize, winners must follow the instructions provided in the winning notification message.</li>
  <li style="margin-bottom: 8px;">All claims must be made within 30 days of the draw date. Unclaimed prizes after this period may be forfeited or rolled over.</li>
  <li style="margin-bottom: 8px;">Prize claims can be submitted online or at designated WinIT offices as communicated to the winner.</li>
</ul>    
</div>`);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    setShowSaveModal(false);
    setShowSuccessModal(true);
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header with Save Button */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Prize Claim Policy
            </h1>
            <p className="text-sm text-gray-500">
              View and edit specific dynamic content on the Go
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Save Changes Button */}
            <button
              onClick={handleSaveClick}
              className="bg-gray-900 text-white px-8 py-3 rounded-3xl font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-5xl">
          {/* Editor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center px-5 py-3 border-b border-gray-200 bg-white flex-wrap gap-2">
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Undo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Redo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                  />
                </svg>
              </button>

              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white">
                <option>Normal text</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Align"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Text color"
              >
                <div className="w-4 h-4 bg-gray-900 rounded border border-gray-300"></div>
              </button>

              <div className="w-px h-6 bg-gray-300"></div>

              <button
                className="px-2.5 py-1 hover:bg-gray-100 rounded font-bold text-sm transition-colors"
                title="Bold"
              >
                B
              </button>
              <button
                className="px-2.5 py-1 hover:bg-gray-100 rounded italic text-sm transition-colors"
                title="Italic"
              >
                I
              </button>
              <button
                className="px-2.5 py-1 hover:bg-gray-100 rounded underline text-sm transition-colors"
                title="Underline"
              >
                U
              </button>
              <button
                className="px-2.5 py-1 hover:bg-gray-100 rounded text-sm transition-colors"
                title="Strikethrough"
              >
                <span style={{ textDecoration: "line-through" }}>S</span>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Subscript"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Code"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </button>

              <div className="w-px h-6 bg-gray-300"></div>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Bullet list"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Numbered list"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Link"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Video"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Code block"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Quote"
              >
                <span className="text-base font-serif">"</span>
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Horizontal line"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
            </div>

            {/* Content Editor */}
            <div className="p-12 bg-white min-h-[600px]">
              <div
                className="focus:outline-none"
                contentEditable
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveModal
        isOpen={showSaveModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseSuccess} />
    </div>
  );
};

export default PriceClaimDetails;
