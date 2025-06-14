'use client';

import { useState, useEffect } from 'react';
import { Project, CreateProjectRequest } from '@/types/api';
import { getProjects, createProject } from '@/lib/api';

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onProjectSettings?: () => void;
}

export default function ProjectSelector({ selectedProject, onProjectSelect, onProjectSettings }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 프로젝트 생성 폼 상태
  const [createForm, setCreateForm] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    isPrivate: false
  });
  const [isCreating, setIsCreating] = useState(false);

  // 프로젝트 목록 로딩
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const result = await getProjects();
    if (result.success) {
      setProjects(result.data);
      // 첫 번째 프로젝트를 기본 선택
      if (result.data.length > 0 && !selectedProject) {
        onProjectSelect(result.data[0]);
      }
    } else {
      console.error('프로젝트 로딩 실패:', result.error);
      // 401 에러는 이미 api.ts에서 처리되므로 여기서는 다른 에러만 처리
      if (result.error?.code !== 'UNAUTHORIZED') {
        alert(result.error?.message || '프로젝트를 불러오는데 실패했습니다.');
      }
    }
    setLoading(false);
  };

  // 새 프로젝트 생성
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    setIsCreating(true);
    
    const projectData: CreateProjectRequest = {
      name: createForm.name.trim(),
      ...(createForm.description?.trim() && { description: createForm.description.trim() }),
      isPrivate: createForm.isPrivate
    };

    const result = await createProject(projectData);
    
    if (result.success) {
      // 새 프로젝트를 목록에 추가하고 선택
      const newProject = result.data;
      setProjects(prev => [...prev, newProject]);
      onProjectSelect(newProject);
      
      // 폼 초기화 및 닫기
      setCreateForm({ name: '', description: '', isPrivate: false });
      setShowCreateForm(false);
      setShowDropdown(false);
    } else {
      alert(result.error?.message || '프로젝트 생성에 실패했습니다.');
    }
    
    setIsCreating(false);
  };

  const handleInputChange = (field: keyof CreateProjectRequest, value: string | boolean) => {
    setCreateForm((prev: CreateProjectRequest) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">프로젝트 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 프로젝트 선택 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-900">
                {selectedProject ? selectedProject.name : '프로젝트 선택'}
              </span>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-2">
                {/* 기존 프로젝트 목록 */}
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onProjectSelect(project);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-gray-500 truncate">{project.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {project.isPrivate && (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                          <span className="text-xs text-gray-400">{project.memberCount}명</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* 새 프로젝트 생성 버튼 */}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">새 프로젝트 만들기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 프로젝트 정보 */}
        {selectedProject && (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{selectedProject.memberCount}명</span>
            </div>
            {selectedProject.isPrivate && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>비공개</span>
              </div>
            )}
            
            {/* 프로젝트 설정 버튼 */}
            {onProjectSettings && (
              <button
                onClick={onProjectSettings}
                className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="프로젝트 설정"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>설정</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">새 프로젝트 만들기</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* 프로젝트 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트 이름을 입력하세요"
                  required
                />
              </div>

              {/* 프로젝트 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택사항)
                </label>
                <textarea
                  value={createForm.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              {/* 공개 설정 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={createForm.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  비공개 프로젝트로 설정
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? '생성 중...' : '프로젝트 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 