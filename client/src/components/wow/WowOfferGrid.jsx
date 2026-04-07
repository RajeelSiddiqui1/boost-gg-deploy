import React from 'react';
import WowOfferCard from './WowOfferCard';

const WowOfferGrid = ({ services, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/5 rounded-[2rem] aspect-[16/20]" />
                ))}
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/5">
                <h3 className="text-2xl font-black uppercase text-white/40 italic">No offers found matching your filters</h3>
                <p className="text-white/20 mt-2">Try adjusting your filters or search for something else.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
                <WowOfferCard key={service._id} service={service} />
            ))}
        </div>
    );
};

export default WowOfferGrid;
