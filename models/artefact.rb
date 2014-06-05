require 'mongoid'

class Artefact
  include Mongoid::Document

  has_and_belongs_to_many :visitor

  field :type, :type => String
end