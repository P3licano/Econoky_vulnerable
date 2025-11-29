import Post, { IPost } from '@/lib/models/Post'
import Profile from '@/lib/models/Profile'
import PostLike from '@/lib/models/PostLike'
import Comment from '@/lib/models/Comment'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  created_at: Date
  updated_at: Date
}

export interface PostWithProfile {
  id: string
  user_id: string
  title: string
  content: string
  image_url?: string
  likes: number
  liked_by_user: boolean
  created_at: Date
  updated_at: Date
  profile?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

export async function getPosts(limit: number = 50, currentUserId?: string): Promise<PostWithProfile[]> {
  await connectDB()
  
  // Obtener posts y luego buscar perfiles (más simple para NoSQL)
  const posts = await Post.find()
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()

  // Obtener IDs únicos de usuarios y convertir a ObjectId válidos
  const userIds = [...new Set(posts.map((p: any) => p.user_id))]
  const objectIds = userIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id))
  
  // Buscar perfiles de esos usuarios
  const profiles = objectIds.length > 0 
    ? await Profile.find({ _id: { $in: objectIds } }).lean()
    : []

  // Crear mapa de perfiles por ID
  const profileMap = new Map(
    profiles.map((p: any) => [p._id.toString(), p])
  )

  // Obtener likes del usuario actual si está autenticado
  const postIds = posts.map((p: any) => p._id.toString())
  const userLikes = currentUserId && postIds.length > 0
    ? await PostLike.find({ 
        post_id: { $in: postIds }, 
        user_id: currentUserId 
      }).lean()
    : []
  const likedPostIds = new Set(userLikes.map((l: any) => l.post_id))

  // Combinar posts con perfiles
  return posts.map((post: any) => {
    const profile = profileMap.get(post.user_id)
    return {
      id: post._id.toString(),
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url || undefined,
      likes: post.likes || 0,
      liked_by_user: likedPostIds.has(post._id.toString()),
      created_at: post.created_at,
      updated_at: post.updated_at,
      profile: profile ? {
        id: profile._id.toString(),
        full_name: profile.full_name || null,
        email: profile.email || null,
        avatar_url: profile.avatar_url || null,
      } : undefined,
    }
  })
}

export async function getPostById(postId: string): Promise<Post | null> {
  await connectDB()
  const post = await Post.findById(postId).lean()
  
  if (!post) return null

  return {
    id: post._id.toString(),
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }
}

export async function getPostsByUserId(userId: string, limit: number = 10): Promise<Post[]> {
  await connectDB()
  const posts = await Post.find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()

  return posts.map((post: any) => ({
    id: post._id.toString(),
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }))
}

export async function toggleLikePost(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
  await connectDB()
  
  // Verificar si el usuario ya dio like
  const existingLike = await PostLike.findOne({ 
    post_id: postId, 
    user_id: userId 
  })

  if (existingLike) {
    // Quitar like
    await PostLike.deleteOne({ _id: existingLike._id })
    await Post.updateOne(
      { _id: postId },
      { $inc: { likes: -1 } }
    )
    const post = await Post.findById(postId).lean()
    return { 
      liked: false, 
      likesCount: Math.max(0, (post?.likes || 0) - 1) 
    }
  } else {
    // Agregar like
    await PostLike.create({
      post_id: postId,
      user_id: userId,
    })
    await Post.updateOne(
      { _id: postId },
      { $inc: { likes: 1 } }
    )
    const post = await Post.findById(postId).lean()
    return { 
      liked: true, 
      likesCount: (post?.likes || 0) + 1 
    }
  }
}

export async function getComments(postId: string): Promise<any[]> {
  await connectDB()
  
  const comments = await Comment.find({ post_id: postId })
    .sort({ created_at: -1 })
    .lean()

  const userIds = [...new Set(comments.map((c: any) => c.user_id))]
  const objectIds = userIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id))
  
  const profiles = objectIds.length > 0 
    ? await Profile.find({ _id: { $in: objectIds } }).select('full_name email avatar_url').lean()
    : []

  const profileMap = new Map(
    profiles.map((p: any) => [p._id.toString(), p])
  )

  return comments.map((comment: any) => {
    const profile = profileMap.get(comment.user_id)
    return {
      id: comment._id.toString(),
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      profile: profile ? {
        id: profile._id.toString(),
        full_name: profile.full_name || null,
        email: profile.email || null,
        avatar_url: profile.avatar_url || null,
      } : undefined,
    }
  })
}

export async function createComment(data: {
  post_id: string
  user_id: string
  content: string
}): Promise<string> {
  await connectDB()
  const comment = await Comment.create({
    post_id: data.post_id,
    user_id: data.user_id,
    content: data.content,
  })
  
  return comment._id.toString()
}

export async function createPost(data: {
  user_id: string
  title: string
  content: string
  image_url?: string
}): Promise<string> {
  await connectDB()
  const post = await Post.create({
    user_id: data.user_id,
    title: data.title,
    content: data.content,
    image_url: data.image_url,
  })
  
  return post._id.toString()
}

export async function updatePost(
  postId: string,
  userId: string,
  data: { title?: string; content?: string }
): Promise<void> {
  await connectDB()
  await Post.updateOne(
    { _id: postId, user_id: userId },
    { $set: data }
  )
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  await connectDB()
  await Post.deleteOne({ _id: postId, user_id: userId })
}

export async function deleteComment(commentId: string): Promise<void> {
  await connectDB()
  await Comment.deleteOne({ _id: commentId })
}
