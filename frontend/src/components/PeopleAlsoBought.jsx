import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
	const [recommendations, setRecommendations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				const res = await axios.get("/products/recommendations");
				setRecommendations(res.data);
				setError(null);
			} catch (error) {
				setError("Failed to load recommendations");
				toast.error(error.response?.data?.message || "An error occurred while fetching recommendations");
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecommendations();
	}, []);

	if (isLoading) return (
		<div className='mt-8 flex flex-col items-center justify-center'>
			<LoadingSpinner />
			<p className='mt-4 text-emerald-400'>Loading recommendations...</p>
		</div>
	);

	if (error) return (
		<div className='mt-8 text-center'>
			<p className='text-red-400'>{error}</p>
		</div>
	);

	if (!recommendations.length) return (
		<div className='mt-8 text-center'>
			<p className='text-emerald-400'>No recommendations available at the moment.</p>
		</div>
	);

	return (
		<div className='mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6'>
			<h3 className='text-2xl font-semibold text-emerald-400 mb-4'>People also bought</h3>
			<div className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{recommendations.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</div>
	);
};
export default PeopleAlsoBought;
