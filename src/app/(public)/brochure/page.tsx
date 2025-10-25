"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Download } from "lucide-react";

export default function BrochurePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pdfUrl = "/brochure.pdf";

  const handleDownload = (): void => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "pecfest-brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-screen h-screen bg-[#010101] flex flex-col relative overflow-hidden">

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-6 z-40 bg-[#0f0444]/95 backdrop-blur-md border-2 border-[#b53da1]/50 rounded-xl shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col py-2">
              <Link
                href="/"
                className="px-4 py-2 text-white hover:bg-[#b53da1]/20 transition-colors flex items-center gap-2 font-semibold text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button
                onClick={() => {
                  handleDownload();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-white hover:bg-[#b53da1]/20 transition-colors flex items-center gap-2 font-semibold text-sm w-full text-left"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer - Native Browser PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-full border-none"
          title="PECFEST Brochure"
        />
      </div>
    </div>
  );
}