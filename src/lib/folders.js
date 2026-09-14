export const getFolderPath = (folderId, folders) => {
  if (!folderId) return "";
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return "";
  const parentPath = folder.parent_id ? getFolderPath(folder.parent_id, folders) : "";
  return parentPath ? `${parentPath} › ${folder.nome}` : folder.nome;
};

export const flattenFolderTree = (folders, parentId = null, depth = 0) => {
  const result = [];
  const children = folders.filter((f) => (f.parent_id || null) === parentId);
  for (const child of children) {
    result.push({ ...child, depth });
    result.push(...flattenFolderTree(folders, child.id, depth + 1));
  }
  return result;
};