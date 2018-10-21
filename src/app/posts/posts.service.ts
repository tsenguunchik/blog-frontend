import { Injectable } from '@angular/core';
import {Post} from './post.model';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], maxPosts: number}>();

  constructor(
    private http: HttpClient,
    private router: Router
    ) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{maxPosts: number, posts: Post[]}>(BACKEND_URL + queryParams)
      .subscribe(post => {
        this.posts = post.posts;
        this.postsUpdated.next({posts: this.posts, maxPosts: post.maxPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<Post>(BACKEND_URL, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: number) {
    return this.http.delete(`${BACKEND_URL}/${id}`);
  }

  updatePost(id: number, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id.toString());
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {id: id, title: title, content: content, imagePath: image};
    }

    this.http.patch<Post>(`${BACKEND_URL}/${id}`, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  getPost(id: number) {
    return this.http.get<Post>(`${BACKEND_URL}/${id}`);
  }
}
