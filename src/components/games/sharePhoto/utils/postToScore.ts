import { Score } from '../../common/Ranking/types';
import { Post } from '../types';

export const postToScore = (post: Post, index: number, points_per_like: number): Score => ({
	uid: post.id,
	imageProfile: post.picture,
	name: post.user_name,
	email: post.email,
	index: index + 1,
	score: `${post.likes * points_per_like}`,
	created_at: post.created_at,
});
