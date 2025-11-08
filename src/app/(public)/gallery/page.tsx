'use client';
import { useState } from "react";
import { ThreeDImageRing } from "@/components/3d-image-ring";
import DomeGallery from "@/components/DomeGallery";
import { ChevronDown, Camera, Film } from "lucide-react";

export default function GalleryPage() {
    const [showDome, setShowDome] = useState(true);
    
    const imageUrls = [
        "https://images.pexels.com/photos/1704120/pexels-photo-1704120.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/114979/pexels-photo-114979.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/698808/pexels-photo-698808.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/2449540/pexels-photo-2449540.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ];

    return (
        <main className="relative w-full min-h-screen overflow-x-hidden bg-[#0a0a0a]">
            {/* Dome Gallery Section - Full Screen */}
            {showDome && (
                <section className="relative w-full h-screen bg-gradient-to-b from-[#1a0a2e] to-[#0a0a0a]">
                    {/* Retro Film Grain Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
                    
                    {/* Retro Header */}
                    <div className="absolute top-0 left-0 right-0 z-20 pt-8 px-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 bg-[#b53da1]/10 border-2 border-[#b53da1] rounded-full backdrop-blur-sm">
                                <Camera className="w-5 h-5 text-[#fea6cc]" />
                                <span className="text-[#ffd4b9] text-sm font-mono tracking-wider">PECFEST MEMORIES</span>
                                <Film className="w-5 h-5 text-[#fea6cc]" />
                            </div>
                            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 text-[#ffd4b9] drop-shadow-[0_0_20px_rgba(255,212,185,0.3)]">
                                Moments That
                            </h1>
                            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-[#ed6ab8] drop-shadow-[0_0_20px_rgba(237,106,184,0.3)]">
                                Never Come Back
                            </h2>
                            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                Step into our time capsule. Each photograph holds a universe of laughter, 
                                energy, and memories that defined PecFest. These aren't just images—
                                they're fragments of moments we'll never get back.
                            </p>
                        </div>
                    </div>

                    {/* Dome Gallery - Full Screen */}
                    <div className="absolute inset-0">
                        <DomeGallery 
                            images={imageUrls}
                            grayscale={false}
                        />
                    </div>

                    {/* Scroll Indicator */}
                    <button
                        onClick={() => setShowDome(false)}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer group"
                    >
                        <span className="text-sm font-mono tracking-wider">EXPLORE MORE</span>
                        <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                    </button>
                </section>
            )}

            {/* Retro Story Section */}
            {!showDome && (
                <section className="relative min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] py-20 px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => setShowDome(true)}
                        className="fixed top-8 left-8 z-50 px-6 py-3 bg-[#b53da1] hover:bg-[#ed6ab8] text-white font-mono text-sm rounded border-2 border-[#fea6cc] transition-all"
                    >
                        ← BACK TO MEMORIES
                    </button>

                    {/* Retro Divider */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#b53da1] to-transparent mb-8" />
                        <h3 className="text-center text-3xl md:text-5xl font-serif text-[#ffd4b9] mb-4">
                            A Journey Through Time
                        </h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#b53da1] to-transparent mt-8" />
                    </div>

                    {/* Story Text Blocks - Retro Style */}
                    <div className="max-w-4xl mx-auto space-y-16 mb-20">
                        <div className="border-l-4 border-[#b53da1] pl-8">
                            <p className="text-white/80 text-xl leading-relaxed font-light">
                                In the golden hours of PecFest, when the stage lights illuminated countless faces 
                                filled with wonder, we captured more than photographs. We captured the essence of youth, 
                                the spirit of celebration, and the magic that happens when thousands of hearts beat as one.
                            </p>
                        </div>

                        <div className="border-l-4 border-[#ed6ab8] pl-8">
                            <p className="text-white/80 text-xl leading-relaxed font-light">
                                These memories are like vinyl records—they age with grace, becoming more precious with time. 
                                Each image is a frame from a movie that played only once, starring you and thousands of others 
                                who dared to make memories instead of watching from the sidelines.
                            </p>
                        </div>

                        <div className="border-l-4 border-[#fea6cc] pl-8">
                            <p className="text-white/80 text-xl leading-relaxed font-light">
                                So take your time. Drag through the dome, spin the ring, and rediscover moments you might have 
                                forgotten. Because in this fast-moving world, these frozen moments are your time machine—
                                your way back to the nights that felt endless and the laughter that echoed through the grounds.
                            </p>
                        </div>
                    </div>

                    {/* 3D Ring Section */}
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h4 className="text-4xl font-serif text-[#ed6ab8] mb-4">
                                The Memory Carousel
                            </h4>
                            <p className="text-white/60 text-lg font-light">
                                Spin through time • Drag to explore • Click to enlarge
                            </p>
                        </div>
                        
                        <div className="w-full h-[700px] flex items-center justify-center border-4 border-[#b53da1]/20 rounded-lg bg-gradient-to-br from-[#1a0a2e]/50 to-[#0a0a0a]/50 backdrop-blur-sm">
                            <ThreeDImageRing 
                                images={imageUrls}
                                perspective={2000}
                                imageDistance={600}
                            />
                        </div>
                    </div>

                    {/* Footer Quote */}
                    <div className="max-w-4xl mx-auto mt-20 text-center">
                        <blockquote className="text-2xl md:text-3xl font-serif italic text-[#ffd4b9]/80 leading-relaxed">
                            "We don't remember days, we remember moments."
                        </blockquote>
                        <p className="text-white/40 mt-4 font-mono text-sm">— Cesare Pavese</p>
                    </div>
                </section>
            )}

            {/* Retro Corner Frame Effects */}
            <div className="fixed top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#b53da1]/30 pointer-events-none z-50" />
            <div className="fixed bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#b53da1]/30 pointer-events-none z-50" />
        </main>
    );
}