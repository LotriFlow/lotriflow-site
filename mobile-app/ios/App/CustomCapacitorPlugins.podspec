Pod::Spec.new do |s|
  s.name = 'CustomCapacitorPlugins'
  s.version = '1.0.0'
  s.summary = 'Custom Capacitor plugins for SmokeFree'
  s.license = 'MIT'
  s.homepage = 'https://github.com/LotriFlow/smokefree'
  s.author = { 'LotriFlow' => 'info@lotriflow.com' }
  s.source = { :git => '', :tag => s.version.to_s }
  s.source_files = 'App/Plugins/**/*.{swift,h,m}'
  s.ios.deployment_target  = '14.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
